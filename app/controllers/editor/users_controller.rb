# frozen_string_literal: true

# This controller manage {User} model for editors
class Editor::UsersController < Editor::ApplicationController
  before_action :set_user, only: %i[show tickets]
  # GET /editor/users
  def index; end

  # GET /editor/users/list
  def list
    options = {}
    options[:admin] = true if filter_params[:admin].present?
    options[:editor] = true if filter_params[:editor].present?
    @text = ['username ilike :text or email ilike :text', { text: "%#{filter_params[:text]}%" }] if filter_params[:text].present?
    @pagy, @users = pagy(User.where(@text).where(options))
  end

  # GET /editor/users/:id
  def show; end

  # GET /editor/users/:id/tickets
  def tickets
    @text = ['facts.title ilike :string', { string: "%#{filter_params[:text]}%" }] if filter_params[:text].present?
    if current_user.admin?
      @pagy, @tickets = pagy( @user.tickets.joins(happening: [:fact]).where(@text), items: 6)
    else
      @pagy, @tickets = pagy(
        @user.tickets.joins(happening: [:fact]).where(happening: { fact: @current_user.facts }).where(@text),
        items: 6
      )
    end
  end

  private

  # Set @user for some method
  def set_user
    @user = User.find(params[:id])
  end

  # Filter params for search a {Fact}
  def filter_params
    params.fetch(:filter, {}).permit(:text, :admin, :editor)
  end
end
