import styles from './styles.module.css';

export default function SidebarMenu() {
  return (
    <aside className={ `wrapper ${styles['menu']}` }>
      <h1>Menu</h1>
    </aside>
  );
}