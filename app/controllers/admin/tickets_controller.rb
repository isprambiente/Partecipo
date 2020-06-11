# frozen_string_literal: true

# This controller show {Ticket} for admins
class Admin::TicketsController < Admin::ApplicationController
  before_action :set_user

  # GET /admin/users/:user_id/tickets
  def index
    @pagy, @tickets = pagy(@user.tickets)
  end

  private

  # set @user when needed
  def set_user
    @user = User.find(params[:user_id])
  end
end
