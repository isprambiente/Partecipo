# frozen_string_literal: true

# This controller manage the generic views
class HomeController < ApplicationController
  def top_menu
    render layout: false
  end
end
