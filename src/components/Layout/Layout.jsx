import { Navbar } from '@/components/Navbar/Navbar'
import styles from './Layout.module.scss'

export function Layout({ children }) {
  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={`${styles['layout__main']} o-container`}>
        {children}
      </main>
    </div>
  )
}
