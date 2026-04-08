import { Button } from '@/components/Button/Button'
import { useRouter } from '@/router'
import styles from './About.module.scss'

export default function About() {
  const { navigate } = useRouter()

  const features = [
    { icon: '⚡', title: 'Ultra rápido', desc: 'Sin librerías externas. Solo React + Vite con SWC.' },
    { icon: '🔀', title: 'Router propio', desc: 'Navegación SPA con History API, sin react-router.' },
    { icon: '🎨', title: 'SCSS + BEMIT', desc: 'ITCSS + BEM + CSS Modules. Sin Tailwind ni CSS-in-JS.' },
    { icon: '🪝', title: 'Hooks custom', desc: 'useFetch, useLocalStorage y useTheme incluidos.' },
  ]

  return (
    <section className={styles.about}>
      <h1 className={styles['about__title']}>Acerca del proyecto</h1>
      <p className={styles['about__desc']}>
        Cashia es una base de proyecto React diseñada para ser lo más liviana posible,
        sin sacrificar estructura ni escalabilidad.
      </p>

      <ul className={styles['about__grid']} role="list">
        {features.map(({ icon, title, desc }) => (
          <li key={title} className={styles['about__card']}>
            <span className={styles['about__card-icon']} aria-hidden="true">{icon}</span>
            <h2 className={styles['about__card-title']}>{title}</h2>
            <p className={styles['about__card-desc']}>{desc}</p>
          </li>
        ))}
      </ul>

      <Button variant="ghost" onClick={() => navigate('/home')}>← Volver al inicio</Button>
    </section>
  )
}
