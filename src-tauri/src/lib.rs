use tauri_plugin_sql::{Migration, MigrationKind};

const CURRICULUM_URL: &str = "https://raw.githubusercontent.com/ossu/computer-science/JSON/curriculum.json";

/// Fetch raw curriculum JSON in Rust (no CORS). The frontend parses and caches it in SQLite.
#[tauri::command]
async fn fetch_curriculum() -> Result<String, String> {
    fetch(CURRICULUM_URL).await
}

async fn fetch(url: &str) -> Result<String, String> {
    let res = reqwest::get(url).await.map_err(|e| e.to_string())?;
    if !res.status().is_success() { return Err(format!("HTTP {}", res.status())); }
    res.text().await.map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![Migration {
        version: 1, description: "init", sql: include_str!("../migrations/001_init.sql"), kind: MigrationKind::Up,
    }];
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().add_migrations("sqlite:ossu.db", migrations).build())
        .invoke_handler(tauri::generate_handler![fetch_curriculum])
        .run(tauri::generate_context!())
        .expect("error while running app");
}

#[cfg(test)]
mod tests {
    #[tokio::test]
    async fn bad_url_returns_err() { assert!(super::fetch("http://127.0.0.1:1/x").await.is_err()); }
}
