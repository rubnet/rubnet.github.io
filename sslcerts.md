Padavan 老毛子 系统 ssl证书过期导致curl不能正常运行


# `curl -V`
curl 7.37.1 (mipsel-unknown-linux-gnu) libcurl/7.37.1 OpenSSL/1.0.2u zlib/1.2.8
Protocols: file ftp ftps http https
Features: IPv6 Largefile NTLM NTLM_WB SSL libz

# `curl  https://v4.ident.me/ `
>curl: (60) SSL certificate problem: certificate has expired
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

# 根据提示可知加入 ` -k (or --insecure) ` 可以临时解决,但是不安全
# openssl 查看是哪个证书过期
`openssl s_client -showcerts -connect v4.ident.me:443 -servername v4.ident.me | head`
>depth=3 O = Digital Signature Trust Co., CN = DST Root CA X3<br>
 verify error:num=10:certificate has expired <br>
 notAfter=Sep 30 14:01:15 2021 GMT<br>
 

# 解决方法: 删除过期中间证书 DST_Root_CA_X3.crt
`cd /opt/etc/ssl/certs && mv DST_Root_CA_X3.crt DST_Root_CA_X3.crt.rm`

