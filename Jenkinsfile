pipeline {
    agent any // Se ejecuta en el servidor local donde está Jenkins

    environment {
        // Jenkins sacará estas variables de su propia bóveda de credenciales
        SUPABASE_URL = credentials('papeleria-supabase-url')
        SUPABASE_ANON = credentials('papeleria-supabase-anon')
        SUPABASE_ROLE = credentials('papeleria-supabase-role')
    }

    stages {
        stage('Preparar Entorno') {
            steps {
                echo 'Inyectando variables de entorno...'
                sh '''
                echo "NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}" > .env.local
                echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON}" >> .env.local
                echo "SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_ROLE}" >> .env.local
                '''
            }
        }

        stage('Construir Imagen Docker') {
            steps {
                echo 'Construyendo imagen optimizada de Next.js...'
                sh 'docker build -t papeleria-imagen .'
            }
        }

        stage('Desplegar Contenedor') {
            steps {
                echo 'Deteniendo versión anterior (si existe)...'
                sh '''
                docker stop papeleria-app || true
                docker rm papeleria-app || true
                '''
                
                echo 'Levantando nueva versión en el puerto 3000...'
                sh 'docker run -d --name papeleria-app -p 3000:3000 --restart unless-stopped --env-file .env.local papeleria-imagen'
            }
        }

        stage('Limpieza') {
            steps {
                echo 'Borrando imágenes huérfanas de Docker...'
                sh 'docker image prune -f'
            }
        }
    }
}