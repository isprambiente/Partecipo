# frozen_string_literal: true

class Admin::TicketsController < Admin::ApplicationController
  before_action :set_user

  # GET /admin/tickets
  # GET /admin/tickets.json
  def index
    @pagy, @tickets = pagy(@user.tickets)
  end

  private

  def set_user
    @user = User.find(params[:user_id])
  end
end
