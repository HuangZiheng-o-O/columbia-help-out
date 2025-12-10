import './columbia_syle.css'

function App() {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-icon active" title="首页">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <div className="sidebar-icon" title="任务列表">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </div>
        <div className="sidebar-icon" title="个人中心">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="logo">Task Plaza</div>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks, places, or users"
            />
          </div>
          <button className="btn-post">Post Task</button>
        </header>

        <div className="sort-bar">
          <div className="sort-label">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="12" x2="16" y2="12"></line>
              <line x1="4" y1="18" x2="12" y2="18"></line>
            </svg>
            Sort by:
          </div>
          <div className="sort-options">
            <button className="sort-btn active">Newest</button>
            <button className="sort-btn">Nearest</button>
            <button className="sort-btn">Credits high→low</button>
          </div>
        </div>

        <div className="task-list">
          <div className="task-grid">
            <div className="task-card">
              <h3 className="task-title">Borrow charger 45W</h3>
              <div className="task-meta">
                <span className="task-tag campus">campus</span>
                <span className="task-tag urgent">⚡ Urgent</span>
                <span className="task-tag verified">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Email verified
                </span>
              </div>
              <div className="task-credits">
                30 <span>credits</span>
              </div>
              <div className="task-details">
                <div className="task-details-item">
                  <span className="task-details-icon">📍</span>
                  <span>Butler Library lobby</span>
                </div>
                <div className="task-details-item">
                  <span className="task-details-icon">⏱️</span>
                  <span>~30 min needed</span>
                </div>
                <div className="task-details-item">
                  <span className="task-details-icon">🕐</span>
                  <span>Posted 12 min ago</span>
                </div>
              </div>
              <div className="task-actions">
                <button className="btn-action btn-ask">Ask first</button>
                <button className="btn-action btn-claim">Claim now</button>
              </div>
            </div>

            <div className="task-card">
              <h3 className="task-title">Advicing</h3>
              <div className="task-meta">
                <span className="task-tag other">other</span>
                <span className="task-tag flexible">🕐 Flexible</span>
                <span className="task-tag verified">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Email verified
                </span>
              </div>
              <div className="task-credits">
                30 <span>credits</span>
              </div>
              <div className="task-details">
                <div className="task-details-item">
                  <span className="task-details-icon">📍</span>
                  <span>Mudd</span>
                </div>
                <div className="task-details-item">
                  <span className="task-details-icon">⏱️</span>
                  <span>~20 min needed</span>
                </div>
                <div className="task-details-item">
                  <span className="task-details-icon">🕐</span>
                  <span>Posted 20 min ago</span>
                </div>
              </div>
              <div className="task-actions">
                <button className="btn-action btn-ask">Ask first</button>
                <button className="btn-action btn-claim">Claim now</button>
              </div>
            </div>

            <div className="task-card">
              <h3 className="task-title">Pick up hotpot base (H-Mart)</h3>
              <div className="task-meta">
                <span className="task-tag daily">Daily</span>
                <span className="task-tag normal">📅 Normal</span>
                <span className="task-tag verified">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Email verified
                </span>
              </div>
              <div className="task-credits">
                8 <span>credits</span>
              </div>
              <div className="task-details">
                <div className="task-details-item">
                  <span className="task-details-icon">📍</span>
                  <span>Nearby H-Mart</span>
                </div>
                <div className="task-details-item">
                  <span className="task-details-icon">⏱️</span>
                  <span>~40 min needed</span>
                </div>
                <div className="task-details-item">
                  <span className="task-details-icon">🕐</span>
                  <span>Posted 1 hr ago</span>
                </div>
              </div>
              <div className="task-actions">
                <button className="btn-action btn-ask">Ask first</button>
                <button className="btn-action btn-claim">Claim now</button>
              </div>
            </div>

            <div className="task-card">
              <h3 className="task-title">NY winter comforter advice</h3>
              <div className="task-meta">
                <span className="task-tag other">other</span>
                <span className="task-tag flexible">🕐 Flexible</span>
              </div>
              <div className="task-credits">
                15 <span>credits</span>
              </div>
              <div className="task-details">
                <div className="task-details-item">
                  <span className="task-details-icon">📍</span>
                  <span>Online</span>
                </div>
                <div className="task-details-item">
                  <span className="task-details-icon">⏱️</span>
                  <span>~10 min needed</span>
                </div>
                <div className="task-details-item">
                  <span className="task-details-icon">🕐</span>
                  <span>Posted 1 day ago</span>
                </div>
              </div>
              <div className="task-actions">
                <button className="btn-action btn-ask">Ask first</button>
                <button className="btn-action btn-claim">Claim now</button>
              </div>
            </div>

            <div className="task-card">
              <h3 className="task-title">Study for exam</h3>
              <div className="task-meta">
                <span className="task-tag academic">academic</span>
                <span className="task-tag urgent">⚡ Urgent</span>
                <span className="task-tag verified">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Email verified
                </span>
              </div>
              <div className="task-credits">
                20 <span>credits</span>
              </div>
              <div className="task-details">
                <div className="task-details-item">
                  <span className="task-details-icon">📍</span>
                  <span>Online</span>
                </div>
                <div className="task-details-item">
                  <span className="task-details-icon">⏱️</span>
                  <span>~30 min needed</span>
                </div>
                <div className="task-details-item">
                  <span className="task-details-icon">🕐</span>
                  <span>Posted 1 day ago</span>
                </div>
              </div>
              <div className="task-actions">
                <button className="btn-action btn-ask">Ask first</button>
                <button className="btn-action btn-claim">Claim now</button>
              </div>
            </div>

            <div className="task-card">
              <h3 className="task-title">Help move furniture</h3>
              <div className="task-meta">
                <span className="task-tag daily">Daily</span>
                <span className="task-tag urgent">⚡ Urgent</span>
                <span className="task-tag verified">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Email verified
                </span>
              </div>
              <div className="task-credits">
                50 <span>credits</span>
              </div>
              <div className="task-details">
                <div className="task-details-item">
                  <span className="task-details-icon">📍</span>
                  <span>Broadway Housing</span>
                </div>
                <div className="task-details-item">
                  <span className="task-details-icon">⏱️</span>
                  <span>~1 hr needed</span>
                </div>
                <div className="task-details-item">
                  <span className="task-details-icon">🕐</span>
                  <span>Posted 2 hr ago</span>
                </div>
              </div>
              <div className="task-actions">
                <button className="btn-action btn-ask">Ask first</button>
                <button className="btn-action btn-claim">Claim now</button>
              </div>
            </div>
          </div>
      </div>
      </main>
      </div>
  )
}

export default App
