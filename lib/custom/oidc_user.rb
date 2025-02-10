class Custom::OidcUser
  def self.from_omniauth(auth)
    user = User.find_or_initialize_by username: auth.uid
    user.email = auth.info.email
    user.password = SecureRandom.alphanumeric(20)
    user.name = auth.info.try(ENV.fetch("RAILS_OIDC_NAME", "given_name" ))
    user.surname = auth.info.try(ENV.fetch("RAILS_OIDC_SURNAME", "family_name" ))
    user.member = auth.info.try(ENV.fetch("RAILS_OIDC_MEMBER", "member")) == ENV.fetch("RAILS_OIDC_MEMBER_VALUE", "true")
    user.skip_confirmation! if RAILS_DEVISE_CONFIRMABLE
    user.save
    user
  end
end
