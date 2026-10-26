import admin from 'firebase-admin'
import env from '../config/env.js'

admin.initializeApp({
  credential: admin.cert({
    "type": env.firebaseServiceType,
    "project_id": env.firebaseProjectId,
    "private_key_id": env.firebasePrivateKeyId,
    "private_key": env.firebasePrivateKey.replace(/\\n/g, '\n'),
    "client_email": env.firebaseClientEmail,
    "client_id": env.firebaseClientId,
    "auth_uri": env.firebaseAuthUri,
    "token_uri": env.firebaseTokenUri,
    "auth_provider_x509_cert_url": env.firebaseAuthProviderX509CertUrl,
    "client_x509_cert_url": env.firebaseClientX509CertUrl
  }

  )
}); 
