# frozen_string_literal: true

# This model manage the group
# === Relations
# has many {Fact}
# has and belongs to many {User}
# === Validates
# * presence of {title}
# @!attribute [rw] title
#   @return [String] group title
class Group < ApplicationRecord
  has_and_belongs_to_many :users
  has_many :facts

  validates :title, presence: true
end
