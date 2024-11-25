Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, {
    name: :openid_connect,
    issuer: ENV.fetch('RAILS_OIDC_ISSUER') {'https://my_issuer.com'},
    scope: [ :openid, :email, :profile ],
    extra_authorize_params: { claim: ENV.fetch('RAILS_OIDC_CLAIMS') {"sub email given_name family_name"}.split.map(&:to_sym) },
    uid_field: ENV.fetch("RAILS_OIDC_USERNAME") {"email"},
    discovery: true,
    client_auth_method: :jwks,
    client_options: {
      port: 443,
      scheme: "https",
      host: ENV.fetch("RAILS_HOST") {"localhost"},
      authorization_endpoint: "/OIDC/authorization",
      token_endpoint: "/OIDC/token",
      userinfo_endpoint: "/OIDC/userinfo",
      jwks_uri: "OIDC/jwks.json",
      identifier: ENV.fetch("RAILS_OIDC_IDENTIFIER") {'partecipo'},
      secret: ENV.fetch("RAILS_OIDC_SECRET") { 'secret' },
      redirect_uri: "https://#{ENV.fetch("RAILS_HOST") {"localhost"}}/users/auth/openid_connect/callback"
    }
  }
end



