# frozen_string_literal: true

# This model manage the {Option} object. An {Option} is a possible answer to a {Question},
# The valid answers are marked by {acceptable} field
#
# === Relations
# belongs to {Question}
#
# === Validates
# * presence of {Question} reference
# * presence of {title}
# * presence of {weight}
# * presence of {acceptable}
#
# @!attribute [rw] id
#   @return [Integer] unique identifier
# @!attribute [rw] question_id
#   @return [Integer] {Question} references
# @!attribute [String] title
#   @return [String] Option title
# @!attribute [rw] weight
#   @return [Integer] order value
# @!attribute [rw] acceptable
#   @return [Boolean] true if is a valid answer
#
# === Scope
# default scope is weight desc
class Option < ApplicationRecord
  include Weightable
  belongs_to :question

  validates :title, presence: true
  validates :weight, presence: true
  validates :acceptable, inclusion: [ true, false ]

  scope :acceptable, -> { where acceptable: true }
end
