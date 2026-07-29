import styles from '@/components/admin/AdminPropertiesList.module.css'

export default function AdminPropertiesLoading() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="Carregando imoveis">
      <div className={styles.loadingLine} />
      <div className={styles.loadingToolbar} />
      <div className={styles.loadingTable} />
    </div>
  )
}
