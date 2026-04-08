import { Navbar } from '@/components/Navbar/Navbar'
import styles from './Layout.module.scss'

export function Layout({ children }) {
  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={`${styles['layout__main']} o-container`}>
        {children}
      </main>
      <footer className={styles['layout__footer']}>
        <p className="o-container">
          © {new Date().getFullYear()} cash.ai
        </p>
      </footer>
    </div>
  )
}
