import { Button } from '@/components/Button/Button'
import { useRouter } from '@/router'
import styles from './Home.module.scss'

export default function Home() {
  const { navigate } = useRouter()

  return (
    <section className={styles.hero}>
      <h1 className={styles['hero__title']}>
        Bienvenido a <span className={styles['hero__highlight']}>Cashia</span>
      </h1>
      <p className={styles['hero__subtitle']}>
        Base sólida en React · Sin librerías · Ultra rápido
      </p>
      <div className={styles['hero__actions']}>
        <Button size="lg" onClick={() => navigate('/about')}>
          Conocer más
        </Button>
        <Button size="lg" variant="secondary">
          Ver código
        </Button>
      </div>
    </section>
  )
}
