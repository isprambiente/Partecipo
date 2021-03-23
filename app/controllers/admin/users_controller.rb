# frozen_string_literal: true

# This controller manage the {User} model for the admins
class Admin::UsersController < Admin::ApplicationController
  before_action :set_user, only: %i[show edit update]

  # GET /admin/users
  def index; end

  # GET /admin/users/list.html
  # GET /admin/users/list.json
  def list
    @search = {}
    @search[:editor] = true if filter_params[:editor] == '1'
    @search[:admin] = true if filter_params[:admin] == '1'
    @text = ['username ilike :text', { text: "%#{filter_params[:text]}%" }] if filter_params[:text].present?
    @pagy, @users = pagy(User.where(@search).where(@text))
  end

  # GET /admin/users/:id
  def show; end

  # GET /admin/users/:id/edit
  def edit
    @groups = Group.all.order(:title).pluck :title, :id
  end

  # PATCH/PUT /admin/users/:id
  def update
    if @user.update(user_params)
      redirect_to admin_user_path(@user), notice: 'User was successfully updated.'
    else
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
    params.fetch(:filter, {}).permit(:text, :editor, :admin)
  end
end
