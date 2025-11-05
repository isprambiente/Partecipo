# frozen_string_literal: true

class Editor::Users::UserComponent < CommonComponent
  def initialize(user:)
    @user = user
  end

  def confirmed_tag
    if @user.confirmed_at?
      tag.div icon_text("fas fa-user", t(".confirmed")),   class: "tag is-success"
    else
      tag.div icon_text("fas fa-user", t(".unconfirmed")), class: "tag is-warning"
    end
  end

  def active_tag
    if @user.locked_at?
      tag.div icon_text("fas fa-lock", t(".lock")), class: "tag is-danger"
    else
      tag.div icon_text("fas fa-unlock", t(".unlock")), class: "tag is-success"
    end
  end

  def member_tag
    tag.div icon_text("fas fa-users", "Member"), class: "tag is-success" if @user.member?
  end
end
