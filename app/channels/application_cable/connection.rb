# frozen_string_literal: true

# This module contain all ActionCable application
module ApplicationCable
  # This class is required to open a stable js channel with the client
  class Connection < ActionCable::Connection::Base
  end
end
