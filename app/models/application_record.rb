# frozen_string_literal: true

# This model contain the methods shared for all models
class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true
end
