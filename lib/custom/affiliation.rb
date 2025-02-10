class Custom::Affiliation
  def initialize(auth)
    # my special receipt:
    # auth.extra.raw_info.try(:is_member) || auth.extra.groups.include?('users')
    auth.info.try(ENV.fetch("RAILS_OIDC_MEMBER", "member")) == ENV.fetch("RAILS_OIDC_MEMBER_VALUE", "true")
  end
end
