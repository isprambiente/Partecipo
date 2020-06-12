# frozen_string_literal: true

# This module contain all ActionCable application
module ApplicationCable
  # This class is required to make a stable js channel with the client
  class Channel < ActionCable::Channel::Base
  end
end
