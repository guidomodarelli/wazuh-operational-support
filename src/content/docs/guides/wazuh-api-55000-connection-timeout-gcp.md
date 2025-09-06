---
title: Fix Wazuh API 55000 connection timeout (GCP)
description: Resolve timeouts when calling the Wazuh Manager API on port 55000 by allowing TCP traffic in Google Cloud firewall and verifying the correct endpoint.
tags: ["how-to", "troubleshooting", "wazuh", "tines", "gcp", "firewall", "api"]
status: "published"
last_reviewed: "2025-09-06"
owner: "@codex"
---

## TL;DR

- Use the Wazuh Manager API endpoint: `https://<MANAGER_IP>:55000/security/user/authenticate`.
- Do not point to indexers (they only serve port 9200, not the security API).
- Allow inbound TCP `55000` to the Manager in Google Cloud VPC firewall from your source IP/CIDR.
- Ensure `wazuh-manager` is running and listening on `55000`, then re‑test (curl/Tines).

## Context

When integrating Tines with the Wazuh Security API to create users, API calls to port `55000` timed out. The Wazuh stack was hosted in Google Cloud Platform (GCP). Root cause: the GCP VPC firewall did not allow inbound TCP `55000` from the on‑premise source to the Wazuh Manager VM(s).

This guide shows how to validate the correct endpoint, check the Manager service and listeners, review OS firewalls, and open GCP firewall to resolve connectivity.

## Steps

### 1) Validate the endpoint (Manager, not Indexers)

- Authentication endpoint: `POST https://<WAZUH_MANAGER_IP>:55000/security/user/authenticate`
- Target the Wazuh Manager VM. Do not target indexers; indexers expose `9200` (Elasticsearch) and do not serve the security API.

Quick curl test (replace placeholders):

```bash
curl -k -s -D- -o /dev/null \
  -X POST "https://<MANAGER_IP>:55000/security/user/authenticate" \
  -H 'Content-Type: application/json' \
  -d '{"username":"<user>","password":"<pass>"}'
```

Notes:
- `-k` ignores TLS verification for testing. Prefer valid TLS in production.

### 2) Check the Manager service and listener (on the VM)

```bash
sudo systemctl status wazuh-manager
sudo ss -ltnp | grep :55000 || sudo ss -ltnp | awk '$4 ~ /:55000/'
```

Expected: a TCP listener on `:55000` (the Wazuh API daemon) when the manager is active.

### 3) Check the OS firewall (if applicable)

- RHEL/CentOS with firewalld:

```bash
sudo firewall-cmd --list-ports
sudo firewall-cmd --zone=public --add-port=55000/tcp --permanent
sudo firewall-cmd --reload
```

- iptables (legacy):

```bash
sudo iptables -L -n | grep 55000 || true
```

- Ubuntu with UFW:

```bash
sudo ufw status verbose
sudo ufw allow 55000/tcp
```

### 4) Allow TCP/55000 in Google Cloud firewall

Identify the VPC network and the target instances (by network tag or service account). Create or update an ingress rule to allow your source IP/CIDR.

- Console path: VPC network → Firewall → Create firewall rule
  - Direction: Ingress
  - Targets: Instances with target tags (e.g., `wazuh-manager`) or specific service account
  - Source filter: IP ranges (your on‑prem/public source or VPN CIDR)
  - Protocols/ports: `tcp:55000`
  - Network: the VPC where Manager VMs run

- gcloud CLI example:

```bash
gcloud compute firewall-rules create allow-wazuh-api-55000 \
  --direction=INGRESS \
  --priority=1000 \
  --network=<VPC_NAME> \
  --action=ALLOW \
  --rules=tcp:55000 \
  --source-ranges=<ONPREM_CIDR> \
  --target-tags=wazuh-manager

# If needed, tag instances:
gcloud compute instances add-tags <INSTANCE_NAME> \
  --zone=<ZONE> \
  --tags=wazuh-manager
```

If you use target service accounts instead of tags, replace `--target-tags` with `--target-service-accounts=<SA_EMAIL>`.

### 5) Re‑test the request (curl or Tines)

Tines HTTP Request action (example):

```json
{
  "method": "POST",
  "url": "https://<MANAGER_IP>:55000/security/user/authenticate",
  "headers": { "Content-Type": "application/json" },
  "payload": { "username": "<user>", "password": "<pass>" },
  "timeout": 30000
}
```

## Examples

### Minimal curl auth probe

```bash
curl -k -w "HTTP %{http_code}\n" -s -o /dev/null \
  -X POST "https://<MANAGER_IP>:55000/security/user/authenticate" \
  -H 'Content-Type: application/json' \
  -d '{"username":"<user>","password":"<pass>"}'
```

### GCP firewall rule (allow tcp:55000)

```bash
gcloud compute firewall-rules create allow-wazuh-api-55000 \
  --direction=INGRESS --priority=1000 --network=<VPC_NAME> \
  --action=ALLOW --rules=tcp:55000 \
  --source-ranges=<ONPREM_CIDR> --target-tags=wazuh-manager
```

## Troubleshooting

- Timeout (ETIMEDOUT): path blocked by network/firewall. Validate VPC firewall rule and any intermediate firewall/VPN ACLs.
- Connection refused (ECONNREFUSED): service not listening or blocked locally. Re‑check `wazuh-manager` status and OS firewall.
- TLS errors (certificate verify failed): install a valid certificate on the Manager or configure your client to trust the CA. Avoid `-k` in production.
- Hitting indexers (9200) by mistake: switch to the Manager’s IP/DNS and port `55000`.
- Clusters/HA: ensure you target the active Manager node or a VIP forwarding to it.

## References

- Wazuh Security API docs: https://documentation.wazuh.com/
- Google Cloud VPC firewall rules: https://cloud.google.com/vpc/docs/firewalls

