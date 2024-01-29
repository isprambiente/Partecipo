# frozen_string_literal: true

# This controller contain the methods shared for all controller
class ApplicationController < ActionController::Base
  include Pagy::Backend
  around_action :switch_locale

  def default_url_options
    { locale: I18n.locale }
  end

  # rescue_from ActiveRecord::RecordNotFound do
  #   record_not_found!
  # end

  private

  def switch_locale(&action)
    locale = params[:locale] || I18n.default_locale
    I18n.with_locale(locale, &action)
  end

  # Render 404 page and stop the work
  # @return [nil]
  def record_not_found!
    render partial: "errors/404", status: :not_found and return
  end

  # Render 401 page and stop the work
  # @return [nil]
  def access_denied!
    render "errors/401", status: :unauthorized and return
  end

  def set_turbo
    @turbo = request.headers["turbo-frame"].present?
  end
end
