## Desenvolvimento

Comando para criar certificados auto-assinados

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./selfsigned.key -out ./selfsigned.crt -subj "/CN=18.230.96.82"
```

> 18.230.96.82 é o IP do ec2