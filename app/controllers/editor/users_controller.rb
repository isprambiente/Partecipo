# frozen_string_literal: true

# This controller manage {User} model for editors
class Editor::UsersController < Editor::ApplicationController
  before_action :set_user, only: %i[show tickets]
  # GET /editor/users
  def index; end

  # GET /editor/users/list
  def list
    @text = ['username ilike :text or email ilike :text', { text: "%#{filter_params[:text]}%" }] if filter_params[:text].present?
    @pagy, @users = pagy(User.where(@text))
  end

  # GET /editor/users/:id
  def show; end

  # GET /editor/users/:id/tickets
  def tickets
    @text = ['facts.title ilike :string', { string: "%#{filter_params[:text]}%" }] if filter_params[:text].present?
    @pagy, @tickets = pagy(
      @user.tickets.joins(happening: [:fact]).where(happening: { fact: @current_user.facts }).where(@text),
      items: 6
    )
  end

  private

  # Set @user for some method
  def set_user
    @user = User.find(params[:id])
  end

  # Filter params for search a {Fact}
  def filter_params
    params.fetch(:filter, {}).permit(:text)
  end
end
