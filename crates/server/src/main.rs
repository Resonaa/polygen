mod game;

use std::env;

use axum::Router;
use game::{RoomPoolStore, handle_connection};
use socketioxide::SocketIo;
use tokio::net::TcpListener;
use tokio::signal;
use tracing::info;
use tracing_subscriber::FmtSubscriber;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
  tracing::subscriber::set_global_default(FmtSubscriber::default())?;

  let port = env::var("PORT").unwrap_or_else(|_| "1606".to_string());

  let room_pool = RoomPoolStore::default();

  let (layer, io) = SocketIo::builder().with_state(room_pool).build_layer();

  io.ns("/", handle_connection);

  let app = Router::new().layer(layer);

  let listener = TcpListener::bind(format!("127.0.0.1:{}", port)).await?;

  info!("server listening on http://127.0.0.1:{}", port);

  axum::serve(listener, app).with_graceful_shutdown(shutdown_signal()).await?;

  Ok(())
}

async fn shutdown_signal() {
  let ctrl_c = async {
    signal::ctrl_c().await.expect("failed to install Ctrl+C handler");
  };

  #[cfg(unix)]
  let terminate = async {
    signal::unix::signal(signal::unix::SignalKind::terminate())
      .expect("failed to install signal handler")
      .recv()
      .await;
  };

  #[cfg(not(unix))]
  let terminate = std::future::pending::<()>();

  tokio::select! {
      _ = ctrl_c => {},
      _ = terminate => {},
  }
}
