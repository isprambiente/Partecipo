# frozen_string_literal: true

class Admin::Users::FormComponent < CommonComponent
  def initialize(user:, groups: [])
    super
    @user = user
    @groups = groups
  end
end
