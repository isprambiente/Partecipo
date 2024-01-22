# frozen_string_literal: true

# This model manage the group
# === Relations
# has many {Event}
# has and belongs to many {User}
# === Validates
# * presence of {title}
# @!attribute [rw] title
#   @return [String] group title
class Group < ApplicationRecord
  has_and_belongs_to_many :users
  has_many :events, dependent: :restrict_with_error

  validates :title, presence: true
end
