# Configuration Supabase pour Beat Store

## 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com) et créez un compte
2. Créez un nouveau projet
3. Notez l'URL du projet et la clé anon

## 2. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Configuration du Storage

Dans le dashboard Supabase, allez dans **Storage** et créez deux buckets :

### Bucket `covers` (public)
- Nom : `covers`
- Public : ✅ Oui
- Utilisé pour : les pochettes des beats

### Bucket `beats` (public pour previews, privé pour full)
- Nom : `beats`
- Public : ✅ Oui (les previews sont publiques)
- Utilisé pour : les fichiers audio

### Politique RLS pour Storage

Allez dans **Storage > Policies** et ajoutez ces politiques pour chaque bucket :

#### Pour le bucket `covers` :
```sql
-- Lecture publique
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'covers');

-- Upload pour utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');

-- Delete pour utilisateurs authentifiés
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (bucket_id = 'covers' AND auth.role() = 'authenticated');
```

#### Pour le bucket `beats` :
```sql
-- Lecture publique (pour previews)
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'beats');

-- Upload pour utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'beats' AND auth.role() = 'authenticated');

-- Delete pour utilisateurs authentifiés
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (bucket_id = 'beats' AND auth.role() = 'authenticated');
```

## 4. Créer un utilisateur Admin

Dans Supabase, allez dans **Authentication > Users** et créez un nouvel utilisateur avec email/mot de passe. Cet utilisateur pourra se connecter à `/login` pour accéder au panneau admin.

Ou utilisez la console SQL :
```sql
-- Créer un utilisateur admin (remplacez les valeurs)
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
VALUES ('admin@example.com', crypt('votre-mot-de-passe', gen_salt('bf')), now(), 'authenticated');
```

## 5. Structure des dossiers Storage

```
covers/
  └── {timestamp}-{random}.{ext}     # Pochettes

beats/
  ├── previews/
  │   └── {timestamp}-{random}.{ext} # Previews (tagués)
  └── full/
      └── {timestamp}-{random}.{ext} # Fichiers complets
```

## Routes protégées

- `/admin` - Panneau d'administration (requiert authentification)
- `/login` - Page de connexion

## Fonctionnalités

- ✅ Authentification admin avec email/mot de passe
- ✅ Protection des routes admin via middleware
- ✅ Upload de fichiers vers Supabase Storage
- ✅ Gestion des pochettes et fichiers audio
- ✅ Déconnexion
