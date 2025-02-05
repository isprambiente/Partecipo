# frozen_string_literal: true

class Admin::Users::UserComponent < CommonComponent
  def initialize(user:)
    super
    @user = user
  end

  def admin_tag
    tag.div icon_text("fas fa-user-shield", "Admin"), class: "tag" if @user.admin?
  end

  def editor_tag
    tag.div icon_text("fas fa-user-gear", "Editor"), class: "tag" if @user.editor?
  end

  def member_tag
    tag.div icon_text("fas fa-users", 'Member'), class: "tag is-success" if @user.member?
  end
end
