/* TODO: add publix_suffix to db structure */
/* TODO: link with headers */
CREATE TABLE IF NOT EXISTS http_requests(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crawl_id INTEGER NOT NULL,
    url VARCHAR(500) NOT NULL,
    method VARCHAR(500) NOT NULL,
    referrer VARCHAR(500) NOT NULL,
    headers VARCHAR(500) NOT NULL,
    visit_id INTEGER NOT NULL,
    time_stamp VARCHAR(500) NOT NULL);
