# frozen_string_literal: true

class Admin::UsersController < Admin::ApplicationController
  before_action :set_user, only: %i[show edit update]

  # GET /admin/users
  # GET /admin/users.json
  def index; end

  def list
    @search = {}
    @search[:editor] = true if filter_params[:editor] == '1'
    @search[:admin] = true if filter_params[:admin] == '1'
    @text = ['username ilike :text', text: "%#{filter_params[:text]}%"] if filter_params[:text].present?
    @pagy, @users = pagy(User.where(@search).where(@text))
  end

  # GET /admin/users/1
  # GET /admin/users/1.json
  def show; end

  def edit
    @groups = Group.all.order(:title).pluck :title, :id
  end

  # PATCH/PUT /admin/users/1
  # PATCH/PUT /admin/users/1.json
  def update
    if @user.update(user_params)
      redirect_to admin_user_path(@user), notice: 'User was successfully updated.'
    else
      render :edit
    end
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_user
    @user = User.find(params[:id])
  end

  # Only allow a list of trusted parameters through.
  def user_params
    params.require(:user).permit(:editor, :admin, group_ids: [])
  end

  def filter_params
    params.fetch(:filter, {}).permit(:text, :editor, :admin)
  end
end
