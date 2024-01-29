# frozen_string_literal: true

module Layout
  # This class manage the site navbar generation (id: nav3)
  class NavbarComponent < CommonComponent
    # @param [Hash] opts
    #   options to generate content
    # @option opts [Object] user
    #   used for define current_user in this component,
    #   default [Nil]
    def initialize(user: nil)
      super
      @user = user
    end

    # Generate an html safe string with full ispra top menu
    # @return [String] html string menu
    def call
      tag.div tag.div(navbar, class: "container"), id: "nav3", class: "has-background-primary-dark"
    end

    # render Bulmacomp::NavbarComponent with the options
    def navbar
      render Bulmacomp::NavbarComponent.new(brand: navbar_title, navbar_start:, navbar_end:,
                                            class: "navbar has-background-primary-dark")
    end

    # Generate the navbar-title html block
    def navbar_title
      safe_join([ icon_text("fas fa-signature", "P"), "artecipo" ])
    end

    # Gerate the navbar-start html block
    def navbar_start
      safe_join [
        link_to(icon_text("fas fa-calendar", t(".events")), events_path, data: { turbo_frame: "yield" },
                                                                         class: "navbar-item"),
        link_to(icon_text("fas fa-calendar-day", t(".happenings")), happenings_path, data: { turbo_frame: "yield" },
                                                                                     class: "navbar-item"),
        link_to(icon_text("fas fa-ticket-alt", t(".tickets")), tickets_path, class: "navbar-item")
      ]
    end

    # Generate the navbar-end html block
    def navbar_end
      ret = [ lang_submenu ]
      if @user.present?
        ret << user_submenu
      else
        ret << link_to(icon_text("fas fa-right-to-bracket", t(".sign_in")), new_user_session_path, data: { turbo: false },
                                                                                                   class: "navbar-item")
      end
      safe_join(ret)
    end

    # Generate the 'select language' submenu html block
    def lang_submenu
      title = icon("fas fa-globe")
      sub = link_to("IT", events_path(locale: "it"),
                    class: "navbar-item") + link_to("EN", events_path(locale: "en"), class: "navbar-item")
      submenu title:, sub:
      # tag.div lang_title + lang_dropdown, class: 'navbar-item has-dropdown is-hoverable has-background-primary-dark'
    end

    def submenu(title:, sub:)
      style = "navbar-item has-dropdown is-hoverable has-background-primary-dark"
      tag.div link_to(title, "", class: "navbar-link") + tag.div(sub, class: "navbar-dropdown"), class: style
    end

    # Generate the user submenu html block
    def user_submenu
      title = icon_text("fas fa-user", @user.email)
      sub = safe_join([
                        editor_submenu,
                        admin_submenu,
                        link_to(t(".user_edit"), edit_user_registration_path, class: "navbar-item"),
                        link_to(t(".sign_out"), destroy_user_session_path, data: { turbo_method: :delete },
                                                                           class: "navbar-item")
                      ])
      submenu title:, sub:
    end

    # @retur [Array] admin menu entries
    def admin_submenu
      return unless @user.admin?

      [
        link_to(t(".admin.groups"), admin_groups_path, data: { turbo: { frame: "yield" } }, class: "navbar-item"),
        link_to(t(".admin.users"), admin_users_path, data: { turbo: { frame: "yield" } }, class: "navbar-item")
      ]
    end

    # @retur [Array] admin menu entries
    def editor_submenu
      return unless @user.editor?

      [
        link_to(t(".editor.events"), editor_events_path, data: { turbo: { frame: "yield" } }, class: "navbar-item"),
        link_to(t(".editor.happenings"), editor_happenings_path, data: { turbo: { frame: "yield" } }, class: "navbar-item"),
        link_to(t(".editor.users"), editor_users_path, data: { turbo: { frame: "yield" } }, class: "navbar-item")

      ]
    end
  end
end
