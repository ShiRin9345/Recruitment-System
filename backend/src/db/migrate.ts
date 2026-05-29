import type { Pool } from "mysql2/promise";

export const migrate = async (pool: Pool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS positions (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      status ENUM('DRAFT', 'PENDING', 'REJECTED', 'PUBLISHED', 'CLOSED') NOT NULL DEFAULT 'DRAFT',
      approval_comment TEXT NULL,
      published_at DATETIME NULL,
      closed_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_positions_status (status),
      INDEX idx_positions_title (title)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};
