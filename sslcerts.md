Padavan 老毛子 系统 ssl证书过期


# `curl -V`
curl 7.37.1 (mipsel-unknown-linux-gnu) libcurl/7.37.1 OpenSSL/1.0.2u zlib/1.2.8
Protocols: file ftp ftps http https
Features: IPv6 Largefile NTLM NTLM_WB SSL libz

# `curl  https://v4.ident.me/ `
curl: (60) SSL certificate problem: certificate has expired
More details here: http://curl.haxx.se/docs/sslcerts.html

curl performs SSL certificate verification by default, using a "bundle"
 of Certificate Authority (CA) public keys (CA certs). If the default
 bundle file isn't adequate, you can specify an alternate file
 using the --cacert option.
If this HTTPS server uses a certificate signed by a CA represented in
 the bundle, the certificate verification probably failed due to a
 problem with the certificate (it might be expired, or the name might
 not match the domain name in the URL).
If you'd like to turn off curl's verification of the certificate, use
 the -k (or --insecure) option.

解决方法删除过期证书 DST_Root_CA_X3.crt 
cd /opt/etc/ssl/certs && mv DST_Root_CA_X3.crt DST_Root_CA_X3.crt.rm

