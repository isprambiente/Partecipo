# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include Pagy::Backend
  layout :set_layout
  before_action :authenticate_user!
  helper_method :nav

  rescue_from ActiveRecord::RecordNotFound do
    record_not_found!
  end

  # return the default nav for all views
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
    render 'errors/401', status: :unauthorized # && return
  end

  # {access_denied!} unless the request.xhr == true
  # @return [nil]
  def xhr_required!
    access_denied! unless request.xhr?
  end
end
