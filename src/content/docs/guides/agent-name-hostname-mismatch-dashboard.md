---
title: Resolve hostname vs agent.name mismatch in Wazuh dashboard
description: Fix inconsistent hostnames in the Wazuh dashboard by validating metadata and performing a clean re-registration of affected agents.
tags: ["how-to", "troubleshooting", "wazuh", "dashboard", "agents", "metadata"]
status: "published"
last_reviewed: "2025-09-06"
owner: "@codex"
---

## TL;DR

- A small subset of agents may show a dashboard hostname different from the OS hostname and API/Discover values.
- Confirm that `agent.name` and `hostname` are independent fields and check for hidden characters or duplicated/old IDs.
- If forcing metadata refresh does not fix it, delete the affected agent(s) and let them re-register to get a fresh ID.
- After a clean re-registration, dashboard, API, and Discover should align; monitor for a few days.

## Context

Some environments report an inconsistency where the Wazuh dashboard displays a hostname for certain agents that does not match the operating system’s real hostname. Direct API queries and Discover logs show the correct values. This typically affects a small fraction of the fleet and is often correlated with very old or previously deleted agent IDs.

`agent.name` and `hostname` are separate fields in Wazuh’s data model. Visual mismatch can be caused by:

- Hidden characters in `agent.name` (e.g., trailing spaces or newlines).
- Stale or cross-linked metadata from previously deleted or re-used agent IDs.
- Incomplete cleanup after manual DB/table operations or removals outside the supported tools/API.

## Steps

1) Validate the mismatch scope

- Compare values in three places for a few affected agents:
  - Dashboard: the displayed agent name/hostname.
  - API: `GET /agents/{id}` and/or `GET /agents?name=<pattern>`.
  - Discover: inspect `agent.name` and `host.hostname` (or `hostname`) fields.
- Note any patterns: very low IDs, recently deleted/recreated agents, or names with unusual spacing.

2) Try a non-destructive refresh (optional)

- From the Manager, attempt to refresh metadata for a target agent: `agent_control -R <ID>` (or use the API to restart the agent), then re-check the dashboard.
- If the mismatch persists, proceed to a clean re-registration.

3) Prepare a clean re-registration plan

- Confirm you can safely remove and re-enroll the affected agents (window/maintenance).
- Decide on your enrollment method (API authd or manual `agent-auth`).

4) Remove the affected agent on the Manager

- Preferred: use the Wazuh API with an auth token.

  - Authenticate: `POST /security/user/authenticate`
  - Delete agent: `DELETE /agents/{id}`
  - Optionally use your version’s supported purge/cleanup options to remove stale metadata.

- Alternative: use Manager tools to remove the agent entry and its key (e.g., `manage_agents` interactive) according to your Wazuh version.

5) Re-register the agent cleanly

- Option A — Reinstall the agent package (safest reset): uninstall then install and enroll again.
- Option B — Re-enroll in place (Linux example):

  ```bash
  # On the agent host
  sudo systemctl stop wazuh-agent
  # Remove old enrollment key (path may vary by OS/version)
  sudo rm -f /var/ossec/etc/client.keys
  # Re-enroll against the Manager (replace placeholders)
  sudo /var/ossec/bin/agent-auth -m <MANAGER_IP_OR_DNS> -A <NEW_AGENT_NAME>
  sudo systemctl start wazuh-agent
  ```

- Windows: stop the Wazuh Agent service, re-enroll with `agent-auth.exe` or the Wazuh Agent Manager UI, then start the service.

6) Verify alignment and monitor

- Confirm the agent received a new ID and appears once in `GET /agents`.
- Check dashboard, API, and Discover; `agent.name` and `hostname` should now be consistent.
- Monitor for 1–2 weeks to confirm the issue does not recur.

## Examples

### Fetch agent data via API

```bash
# 1) Get an auth token
curl -sk -X POST "https://<MANAGER_IP>:55000/security/user/authenticate" \
  -H 'Content-Type: application/json' \
  -d '{"username":"<user>","password":"<pass>"}'

# 2) Inspect an agent by ID
curl -sk -H "Authorization: Bearer <TOKEN>" \
  "https://<MANAGER_IP>:55000/agents/<ID>?pretty=true"

# 3) Delete an agent by ID (clean up on Manager)
curl -sk -X DELETE -H "Authorization: Bearer <TOKEN>" \
  "https://<MANAGER_IP>:55000/agents/<ID>"
```

### Re-enroll an agent (Linux)

```bash
sudo systemctl stop wazuh-agent
sudo rm -f /var/ossec/etc/client.keys
sudo /var/ossec/bin/agent-auth -m <MANAGER_IP_OR_DNS> -A <NAME>
sudo systemctl start wazuh-agent
```

## Troubleshooting

- Duplicate or ghost entries: if an old ID still appears, ensure the deletion succeeded and there are no cluster replication delays. Recheck after a short interval.
- Hidden characters in `agent.name`: retrieve the name via API and check for trailing spaces/newlines. Normalize names during re-enrollment.
- Manual DB edits: avoid direct table manipulation; prefer supported Manager tools or the API to keep metadata consistent across components.
- Bulk cleanup: consider scheduled removal of never-connected or long-disconnected agents via the API to prevent ID reuse confusion.

## References

- Wazuh Agents API: https://documentation.wazuh.com/
- Wazuh enrollment (agent-auth): https://documentation.wazuh.com/
---
