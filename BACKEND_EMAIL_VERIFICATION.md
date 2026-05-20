# Vérification email à l'inscription — endpoints backend à ajouter

Le frontend appelle 2 nouveaux endpoints lors de l'inscription.
Le même système d'OTP que `forgot-password` peut être réutilisé.

---

## 1. POST /api/auth/send-verification-code

Envoie un code OTP à 6 chiffres à l'email fourni.
**Ne crée pas encore le compte.**

### Body
```json
{ "email": "user@example.com", "name": "Sophie" }
```

### Logique
- Vérifier que l'email n'est pas déjà utilisé → 409 si oui
- Générer un code OTP 6 chiffres (même logique que forgot-password)
- Stocker le code en base (ou Redis) avec TTL 15 minutes, clé : `verify:email:<email>`
- Envoyer l'email via le même transporteur nodemailer (mail de Wênam)

### Template email (à adapter au design existant)
```
Objet : Votre code de confirmation Wênam

Bonjour [name],

Voici votre code de confirmation pour créer votre compte Wênam :

    [CODE]

Ce code expire dans 15 minutes.
Si vous n'avez pas demandé cela, ignorez cet email.

— L'équipe Wênam
```

### Réponses
- `200` : `{ message: "Code envoyé" }`
- `409` : `{ message: "Cet email est déjà utilisé" }`
- `429` : rate limit (optionnel)

---

## 2. POST /api/auth/verify-email-code

Vérifie le code OTP avant la création du compte.

### Body
```json
{ "email": "user@example.com", "code": "123456" }
```

### Logique
- Récupérer le code stocké pour cet email
- Vérifier qu'il n'est pas expiré
- Vérifier que le code correspond
- Marquer le code comme utilisé (le supprimer)

### Réponses
- `200` : `{ message: "Email vérifié", verified: true }`
- `400` : `{ message: "Code incorrect ou expiré" }`

---

## Flux complet

```
[Client]                          [Backend]
   |                                 |
   |-- POST /send-verification-code ->|  génère OTP, envoie email
   |<-- 200 OK ----------------------|
   |                                 |
   |  (user entre le code)           |
   |                                 |
   |-- POST /verify-email-code ------>|  vérifie OTP
   |<-- 200 { verified: true } -------|
   |                                 |
   |-- POST /auth/register ---------->|  crée le compte normalement
   |<-- 200 { user, token } ---------|
```

---

## Note sur la sécurité
- Limiter à 3 tentatives par code (puis invalider)
- Rate limit sur `/send-verification-code` : max 3 envois / 10 min / email
- Le code `/auth/register` existant n'a pas besoin de changer
