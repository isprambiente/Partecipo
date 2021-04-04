# frozen_string_literal: true

# This controller contain the methods shared for all controller
class ApplicationController < ActionController::Base
  include Pagy::Backend
  layout :set_layout
  before_action :authenticate_user!
  helper_method :nav

  rescue_from ActiveRecord::RecordNotFound do
    record_not_found!
  end

  def nav
    'nav_user'
  end

  private

  # Render 404 page and stop the work
  # @return [nil]
  def record_not_found!
    render partial: 'errors/404', status: 404 && return
  end

  # Select the layout name based on request type: xhr request or other
  # @return [String] the layout name
  def set_layout
    request.xhr? ? 'empty' : 'application'
  end

  # Render 401 page and stop the work
  # @return [nil]
  def access_denied!
    render 'errors/401', status: :unauthorized, layout: 'empty' # && return
  end
end
