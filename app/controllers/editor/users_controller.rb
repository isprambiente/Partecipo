# frozen_string_literal: true

module Editor
  # This controller manage {User} model for editors
  class UsersController < Editor::ApplicationController
    before_action :set_user, only: %i[show tickets]
    # GET /editor/users
    def index
      if filter_params[:text].present?
        @text = [ "email ilike :text or email ilike :text",
                 { text: "%#{filter_params[:text]}%" } ]
      end
      @pagy, @users = pagy User.where(@text)
    end

    # GET /editor/users/list
    def list
      if filter_params[:text].present?
        @text = [ "email ilike :text or email ilike :text",
                 { text: "%#{filter_params[:text]}%" } ]
      end
      @pagy, @users = pagy(User.where(@text).where(options))
    end

    # GET /editor/users/:id
    def show
      @categories = [[@user.email,@user.id]]
    end

    # GET /editor/users/:id/tickets
    def tickets
      @text = [ "events.title ilike :string", { string: "%#{filter_params[:text]}%" } ] if filter_params[:text].present?
      if current_user.admin?
        @pagy, @tickets = pagy(@user.tickets.joins(happening: [ :event ]).where(@text), items: 6)
      else
        @pagy, @tickets = pagy(
          @user.tickets.joins(happening: [ :event ]).where(happening: { event: @current_user.events }).where(@text),
          items: 6
        )
      end
    end

    private

    # Set @user for some method
    def set_user
      @user = User.find(params[:id])
    end

    # Filter params for search a {Event}
    def filter_params
      params.fetch(:filter, {}).permit(:text, :admin, :editor)
    end
  end
end
