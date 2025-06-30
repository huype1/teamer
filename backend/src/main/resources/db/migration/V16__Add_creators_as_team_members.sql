-- Add team creators as ADMIN members for existing teams
INSERT INTO team_members (team_id, user_id, role, joined_at)
SELECT t.id, t.created_by, 'ADMIN', t.created_at
FROM teams t
WHERE NOT EXISTS (
    SELECT 1 FROM team_members tm 
    WHERE tm.team_id = t.id AND tm.user_id = t.created_by
); 