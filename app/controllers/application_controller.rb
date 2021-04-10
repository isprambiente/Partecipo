# frozen_string_literal: true

# This controller contain the methods shared for all controller
class ApplicationController < ActionController::Base
  include Pagy::Backend
  #layout 'application'
  before_action :authenticate_user!

  rescue_from ActiveRecord::RecordNotFound do
    record_not_found!
  end

  private

  # Render 404 page and stop the work
  # @return [nil]
  def record_not_found!
    render partial: 'errors/404', status: 404 && return
  end

  # Render 401 page and stop the work
  # @return [nil]
  def access_denied!
    render 'errors/401', status: :unauthorized
  end
end
