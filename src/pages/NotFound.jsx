import { Button } from '@/components/Button/Button'
import { useRouter } from '@/router'
import styles from './NotFound.module.scss'

export default function NotFound() {
  const { navigate } = useRouter()

  return (
    <section className={styles['not-found']}>
      <span className={styles['not-found__code']}>404</span>
      <h1 className={styles['not-found__title']}>Página no encontrada</h1>
      <p className={styles['not-found__desc']}>La ruta que buscas no existe.</p>
      <Button onClick={() => navigate('/')}>Ir al inicio</Button>
    </section>
  )
}
