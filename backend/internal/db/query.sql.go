// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: query.sql

package db

import (
	"context"
	"database/sql"
)

const createReport = `-- name: CreateReport :execresult
INSERT INTO report_action (
  reporter_user_id,
  reporter_session,
  baduser_session,
  badmessage_transcript,
  badmessage_recording
) VALUES (
  ?, ?, ?, ?, ?
)
`

type CreateReportParams struct {
	ReporterUserID       int64
	ReporterSession      string
	BaduserSession       string
	BadmessageTranscript string
	BadmessageRecording  string
}

func (q *Queries) CreateReport(ctx context.Context, arg CreateReportParams) (sql.Result, error) {
	return q.db.ExecContext(ctx, createReport,
		arg.ReporterUserID,
		arg.ReporterSession,
		arg.BaduserSession,
		arg.BadmessageTranscript,
		arg.BadmessageRecording,
	)
}

const createUser = `-- name: CreateUser :execresult
INSERT INTO users (
  username, password, callsign, country, registration_session
) VALUES (
  ?, ?, ?, ?, ?
)
`

type CreateUserParams struct {
	Username            string
	Password            string
	Callsign            string
	Country             interface{}
	RegistrationSession string
}

func (q *Queries) CreateUser(ctx context.Context, arg CreateUserParams) (sql.Result, error) {
	return q.db.ExecContext(ctx, createUser,
		arg.Username,
		arg.Password,
		arg.Callsign,
		arg.Country,
		arg.RegistrationSession,
	)
}

const deleteUser = `-- name: DeleteUser :exec
DELETE FROM users
WHERE username = ?
`

func (q *Queries) DeleteUser(ctx context.Context, username string) error {
	_, err := q.db.ExecContext(ctx, deleteUser, username)
	return err
}

const getCallsign = `-- name: GetCallsign :one
SELECT callsign FROM users
WHERE callsign = ? LIMIT 1
`

func (q *Queries) GetCallsign(ctx context.Context, callsign string) (string, error) {
	row := q.db.QueryRowContext(ctx, getCallsign, callsign)
	err := row.Scan(&callsign)
	return callsign, err
}

const getUser = `-- name: GetUser :one
SELECT id, username, password, callsign, country, settings, is_banned, is_verified, is_moderator, registration_session, registration_timestamp, last_online_timestamp FROM users
WHERE username = ? LIMIT 1
`

func (q *Queries) GetUser(ctx context.Context, username string) (User, error) {
	row := q.db.QueryRowContext(ctx, getUser, username)
	var i User
	err := row.Scan(
		&i.ID,
		&i.Username,
		&i.Password,
		&i.Callsign,
		&i.Country,
		&i.Settings,
		&i.IsBanned,
		&i.IsVerified,
		&i.IsModerator,
		&i.RegistrationSession,
		&i.RegistrationTimestamp,
		&i.LastOnlineTimestamp,
	)
	return i, err
}

const getUserFromId = `-- name: GetUserFromId :one
SELECT id, username, password, callsign, country, settings, is_banned, is_verified, is_moderator, registration_session, registration_timestamp, last_online_timestamp FROM users
WHERE id = ? LIMIT 1
`

func (q *Queries) GetUserFromId(ctx context.Context, id int64) (User, error) {
	row := q.db.QueryRowContext(ctx, getUserFromId, id)
	var i User
	err := row.Scan(
		&i.ID,
		&i.Username,
		&i.Password,
		&i.Callsign,
		&i.Country,
		&i.Settings,
		&i.IsBanned,
		&i.IsVerified,
		&i.IsModerator,
		&i.RegistrationSession,
		&i.RegistrationTimestamp,
		&i.LastOnlineTimestamp,
	)
	return i, err
}

const listModerators = `-- name: ListModerators :many
SELECT id, username, password, callsign, country, settings, is_banned, is_verified, is_moderator, registration_session, registration_timestamp, last_online_timestamp FROM users
WHERE is_moderator == 1
`

func (q *Queries) ListModerators(ctx context.Context) ([]User, error) {
	rows, err := q.db.QueryContext(ctx, listModerators)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []User
	for rows.Next() {
		var i User
		if err := rows.Scan(
			&i.ID,
			&i.Username,
			&i.Password,
			&i.Callsign,
			&i.Country,
			&i.Settings,
			&i.IsBanned,
			&i.IsVerified,
			&i.IsModerator,
			&i.RegistrationSession,
			&i.RegistrationTimestamp,
			&i.LastOnlineTimestamp,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const updateSettings = `-- name: UpdateSettings :execresult
UPDATE users SET settings = ? WHERE id = ?
`

type UpdateSettingsParams struct {
	Settings interface{}
	ID       int64
}

func (q *Queries) UpdateSettings(ctx context.Context, arg UpdateSettingsParams) (sql.Result, error) {
	return q.db.ExecContext(ctx, updateSettings, arg.Settings, arg.ID)
}
