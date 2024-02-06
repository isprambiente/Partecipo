# frozen_string_literal: true

# Manage question for any section.
#
# === Relations
# Relations::
#   - belongs to {happening}
#   - has_many {Answer}, dependent: :destroy
#   - has_many {Option}, dependent: :destroy
#
# === Validations
# * presence of {title}
# * presence of {category}
# * presence of {weight}
# * presence of {mandatory}
#
# @!attribute [rw] id
#   @return [Integer] unique identifier
# @!attribute [rw] section_id
#   @return [Integer] reference for {Section}
# @!attribute [rw] title
#   @return [String] question text
# @!attribute [rw] category
#   @return [String] enum of question typologies
# @!attribute [rw] weight
#   @return [Integer] Question order
# @!attribute [rw] mandatory
#   @return [Boolean] define if the answer is mandatory
# @!method self.acceptable
#   @return [Array] list of related options where {acceptable} is true
class Question < ApplicationRecord
  include Weightable
  belongs_to :happening
  has_many :answers, dependent: :destroy
  has_many :options, dependent: :destroy

  accepts_nested_attributes_for :options, allow_destroy: true, reject_if: :all_blank

  enum category: %i(string text select file), _prefix: true

  validates :title, presence: true
  validates :weight, presence: true
  validates :category, presence: true
  validates :mandatory, inclusion: { in: [true, false], allow_nil: false }

  scope :mandatory, -> { where mandatory: true }
end
