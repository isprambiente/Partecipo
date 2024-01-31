# frozen_string_literal: true

module Admin
  # This controller manage the {User} model for the admins
  class UsersController < Admin::ApplicationController
    before_action :set_user, only: %i[edit update]

    # GET /admin/users
    def index
      @categories = [ "Admin", "Editor" ]
      @search = {}
      @search[:editor] = true if filter_params[:category] == "Editor"
      @search[:admin] = true if filter_params[:category] == "Admin"
      @text = [ "email ilike :text", { text: "%#{filter_params[:text]}%" } ] if filter_params[:text].present?
      @pagy, @users = pagy(User.where(@search).where(@text))
    end

    # GET /admin/users/:id/edit
    def edit
      @groups = Group.all.order(:title).pluck :title, :id
    end

    # PATCH/PUT /admin/users/:id
    def update
      if @user.update(user_params)
        respond_to do |format|
          format.html { redirect_to admin_users_path }
          format.turbo_stream
        end
      else
        @groups = Group.all.order(:title).pluck :title, :id
        render :edit
      end
    end

    private

    # set @user when needed
    def set_user
      @user = User.find(params[:id])
    end

    # Filter params for set an {User}
    def user_params
      params.require(:user).permit(:editor, :admin, group_ids: [])
    end

    # Filter params for search an {User}
    def filter_params
      params.fetch(:filter, {}).permit(:text, :category)
    end
  end
end
