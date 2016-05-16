/* TODO: add publix_suffix to db structure */
/* TODO: link with headers */
/* TODO: link with requests */
CREATE TABLE IF NOT EXISTS http_responses(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crawl_id INTEGER NOT NULL,
    url VARCHAR(500) NOT NULL,
    method VARCHAR(500) NOT NULL,
    referrer VARCHAR(500) NOT NULL,
    response_status INTEGER NOT NULL,
    response_status_text VARCHAR(500) NOT NULL,
    headers VARCHAR(500) NOT NULL,
    location VARCHAR(500) NOT NULL,
    visit_id INTEGER NOT NULL,
    time_stamp VARCHAR(500) NOT NULL,
    content_hash VARCHAR(50));