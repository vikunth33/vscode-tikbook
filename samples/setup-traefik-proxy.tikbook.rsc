#| # Installing Traefik Web Proxy as `/container`
#| ## Setup environment variables
/container envs
add key=TRAEFIK_LOG_LEVEL name=traefik-proxy value=DEBUG
add key=TRAEFIK_PROVIDERS_FILE_DIRECTORY name=traefik-proxy value=/etc/traefik
add key=TRAEFIK_PROVIDERS_FILE_WATCH name=traefik-proxy value=true
add key=TRAEFIK_API_INSECURE name=traefik-proxy value=true
add key=TRAEFIK_ENTRYPOINTS_WEB_ADDRESS name=traefik-proxy value=:8081
add key=TRAEFIK_ENTRYPOINTS_WEBSECURE_ADDRESS name=traefik-proxy value=:8443
add key=TRAEFIK_CERTIFICATESRESOLVERS_LETSENCRYPT_ACME_EMAIL name=traefik-proxy value=null@example.com
add key=TRAEFIK_CERTIFICATESRESOLVERS_LETSENCRYPT_ACME_STORAGE name=traefik-proxy value=acme.json
add key=TRAEFIK_CERTIFICATESRESOLVERS_LETSENCRYPT_ACME_HTTPCHALLENGE_ENTRYPOINT name=traefik-proxy value=web
add key=PROXY_TO_URL name=traefik-proxy value=http://localhost:80/
add key=TRAEFIK_CERTIFICATESRESOLVERS_LETSENCRYPT_ACME name=traefik-proxy value=true
add key=TRAEFIK_ENTRYPOINTS_WEB_HTTP_REDIRECTIONS_ENTRYPOINT_TO name=traefik-proxy value=websecure
add key=TRAEFIK_SERVERSTRANSPORT_INSECURESKIPVERIFY name=traefik-proxy value=true
add key=TRAEFIK_ENTRYPOINTS_WEBSECURE_HTTP_TLS name=traefik-proxy value=true
add key=TRAEFIK_ENTRYPOINTS_WEBSECURE_HTTP_TLS_CERTRESOLVER name=traefik-proxy value=letsencrypt
add key=TRAEFIK_ENTRYPOINTS_WEBSECURE_HTTP_TLS_DOMAINS_1_MAIN name=traefik-proxy value="$[/ip/cloud/get dns-name]"
add key=TRAEFIK_LOG_NOCOLOR name=traefik-proxy value=false
#| ### Setup /container and VETH
:global rootdisk "disk1"
/interface/veth/add name=veth-traefik address=172.18.18.18/24 gateway=172.18.18.1
/ip/address/add interface=veth-traefik address=172.18.18.1/24
/container add interface=veth-traefik logging=yes mounts=TRAEFIK_ETC root-dir="$rootdisk/traefik-etc"
/container add root-dir="$rootdisk/traefik-root" remote-image=library/traefik:v2.10 logging=yes interface=veth-traefik mounts=TRAEFIK_ETC
/container start
#| # Config
/ip firewall nat add comment="LAN port 80 to traefik web proxy" action=dst-nat chain=dstnat dst-port=8080 protocol=tcp src-address-list=LAN to-addresses=172.18.18.18 to-ports=8080
/ip firewall nat add comment="all (except traefik) port 80 to traefik web proxy" action=dst-nat chain=dstnat  dst-port=443 protocol=tcp to-addresses=172.18.18.18 from-address=!172.18.18.0/24 to-ports=443
/ip firewall nat add comment="all (except traefik) port 443 to traefik web proxy" action=dst-nat chain=dstnat  dst-port=80 protocol=tcp to-addresses=172.18.18.18 from-address=!172.18.18.0/24 to-ports=80