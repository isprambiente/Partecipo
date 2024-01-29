# frozen_string_literal: true

class Users::UserComponent < CommonComponent
  def initialize(user:, url:, turbo_frame: "users")
    @user = user
    @url = url
    @turbo_frame = turbo_frame
  end

  def admin_tag
    tag.div icon_text("fas fa-user-shield", "Admin"), class: "tag" if @user.admin?
  end

  def editor_tag
    tag.div icon_text("fas fa-user-gear", "Editor"), class: "tag" if @user.editor?
  end
end
